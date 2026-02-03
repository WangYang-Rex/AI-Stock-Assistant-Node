import { SchedulerService } from './scheduler.service';
export declare class SchedulerController {
    private readonly schedulerService;
    constructor(schedulerService: SchedulerService);
    getStatus(): {
        service: string;
        status: string;
        schedules: {
            name: string;
            cron: string;
            description: string;
        }[];
    };
    triggerSync(): Promise<{
        message: string;
        timestamp: string;
    }>;
    triggerTrendSync(): Promise<{
        message: string;
        timestamp: string;
    }>;
}
