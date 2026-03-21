import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
export declare class SettingService {
    private settingRepository;
    constructor(settingRepository: Repository<Setting>);
    get(key: string): Promise<string | null>;
    getValue(key: string): Promise<string | null>;
    findAll(): Promise<Setting[]>;
    set(key: string, value: string, description?: string): Promise<Setting>;
    setMultiple(settings: {
        key: string;
        value: string;
        description?: string;
    }[]): Promise<void>;
    initDefaultSettings(): Promise<void>;
}
