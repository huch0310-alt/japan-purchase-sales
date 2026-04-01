"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MembersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const member_level_entity_1 = require("./entities/member-level.entity");
const customer_member_entity_1 = require("./entities/customer-member.entity");
const points_log_entity_1 = require("./entities/points-log.entity");
const messages_service_1 = require("../messages/messages.service");
let MembersService = MembersService_1 = class MembersService {
    constructor(levelRepository, memberRepository, pointsLogRepository, messagesService, dataSource) {
        this.levelRepository = levelRepository;
        this.memberRepository = memberRepository;
        this.pointsLogRepository = pointsLogRepository;
        this.messagesService = messagesService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(MembersService_1.name);
    }
    async getLevels() {
        return this.levelRepository.find({ order: { sortOrder: 'ASC' } });
    }
    async getLevelByPoints(points) {
        return this.levelRepository
            .createQueryBuilder('level')
            .where('level.minPoints <= :points', { points })
            .orderBy('level.minPoints', 'DESC')
            .getOne();
    }
    async getCustomerMember(customerId) {
        return this.memberRepository.findOne({
            where: { customerId },
            relations: ['level'],
        });
    }
    async createCustomerMember(customerId) {
        const defaultLevel = await this.levelRepository.findOne({ where: { name: 'Bronze' } });
        const member = this.memberRepository.create({
            customerId,
            levelId: defaultLevel?.id,
            points: 0,
            totalPoints: 0,
        });
        return this.memberRepository.save(member);
    }
    async addPoints(customerId, points, type, relatedId, remark) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const defaultLevel = await queryRunner.manager.findOne(member_level_entity_1.MemberLevel, { where: { name: 'Bronze' } });
            await queryRunner.manager.query(`INSERT INTO customer_members (customer_id, level_id, points, total_points, created_at, updated_at)
         VALUES ($1, $2, 0, 0, NOW(), NOW())
         ON CONFLICT (customer_id) DO UPDATE SET updated_at = NOW()
         RETURNING id`, [customerId, defaultLevel?.id]);
            const member = await queryRunner.manager.findOne(customer_member_entity_1.CustomerMember, { where: { customerId } });
            if (!member) {
                throw new Error('会员创建失败');
            }
            await queryRunner.manager
                .createQueryBuilder()
                .update(customer_member_entity_1.CustomerMember)
                .set({
                points: () => `points + ${points}`,
                totalPoints: () => `totalPoints + ${points}`,
            })
                .where('id = :id', { id: member.id })
                .execute();
            await queryRunner.manager.save(points_log_entity_1.PointsLog, {
                customerId,
                type,
                points,
                relatedId,
                remark,
            });
            await queryRunner.commitTransaction();
            await this.checkLevelUpgrade(customerId);
            return this.getCustomerMember(customerId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async usePoints(customerId, points, relatedId, remark) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const member = await queryRunner.manager.findOne(customer_member_entity_1.CustomerMember, { where: { customerId } });
            if (!member) {
                throw new common_1.BadRequestException('会员不存在');
            }
            if (member.points < points) {
                throw new common_1.BadRequestException('积分不足');
            }
            const result = await queryRunner.manager
                .createQueryBuilder()
                .update(customer_member_entity_1.CustomerMember)
                .set({ points: () => `points - ${points}` })
                .where('id = :id AND points >= :points', { id: member.id, points })
                .execute();
            if (result.affected === 0) {
                throw new common_1.BadRequestException('积分不足');
            }
            await queryRunner.manager.save(points_log_entity_1.PointsLog, {
                customerId,
                type: points_log_entity_1.PointsType.ORDERUse,
                points: -points,
                relatedId,
                remark,
            });
            await queryRunner.commitTransaction();
            return this.getCustomerMember(customerId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async checkLevelUpgrade(customerId) {
        const member = await this.getCustomerMember(customerId);
        if (!member)
            return;
        const newLevel = await this.getLevelByPoints(member.totalPoints);
        if (newLevel && newLevel.id !== member.levelId) {
            const oldLevelId = member.levelId;
            member.levelId = newLevel.id;
            await this.memberRepository.save(member);
            await this.messagesService.create({
                userId: customerId,
                userType: 'customer',
                title: '会员等级升级',
                content: `恭喜！您的会员等级已从 ${oldLevelId} 升级为 ${newLevel.name}，享受更多优惠！`,
                type: 'member_upgrade',
            });
            this.logger.log(`会员升级: ${customerId} 升级为 ${newLevel.name}`);
        }
    }
    async getPointsLogs(customerId, limit = 20) {
        return this.pointsLogRepository.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = MembersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(member_level_entity_1.MemberLevel)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_member_entity_1.CustomerMember)),
    __param(2, (0, typeorm_1.InjectRepository)(points_log_entity_1.PointsLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        messages_service_1.MessagesService,
        typeorm_2.DataSource])
], MembersService);
//# sourceMappingURL=members.service.js.map