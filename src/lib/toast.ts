type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

type ToastListener = (toasts: Toast[]) => void;

class ToastStore {
    private toasts: Toast[] = [];
    private listeners: ToastListener[] = [];

    subscribe(listener: ToastListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.toasts));
    }

    add(type: ToastType, message: string, duration = 5000) {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, type, message, duration };

        this.toasts = [...this.toasts, toast];
        this.notify();

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    }

    remove(id: string) {
        this.toasts = this.toasts.filter(t => t.id !== id);
        this.notify();
    }

    success(message: string, duration?: number) {
        return this.add('success', message, duration);
    }

    error(message: string, duration?: number) {
        return this.add('error', message, duration);
    }

    warning(message: string, duration?: number) {
        return this.add('warning', message, duration);
    }

    info(message: string, duration?: number) {
        return this.add('info', message, duration);
    }
}

export const toast = new ToastStore();
