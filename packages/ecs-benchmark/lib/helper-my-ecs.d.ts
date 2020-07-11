export declare const my_ecs: {
    count: {
        num: number;
    };
    name: string;
    setup: () => void;
    createEntities: () => import("ecs/lib/entity").Entity[];
    removeEntities: (entities: any[]) => void;
    removeVelocity: (entities: any[]) => void;
    addVelocity: (entity: any) => void;
    update: () => void;
};
