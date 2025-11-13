export interface LoadingModalConfig {
    message?: string;
    type: 'create' | 'update' | 'delete';
    isVisible: boolean;
}