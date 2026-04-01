import { SettingService } from './settings.service';
export declare class SettingsController {
    private readonly settingService;
    constructor(settingService: SettingService);
    findAll(): Promise<import("./entities/setting.entity").Setting[]>;
    findOne(key: string): Promise<string | null>;
    setMultiple(body: {
        key: string;
        value: string;
        description?: string;
    }[]): Promise<{
        message: string;
    }>;
    set(body: {
        key: string;
        value: string;
        description?: string;
    }): Promise<import("./entities/setting.entity").Setting>;
}
