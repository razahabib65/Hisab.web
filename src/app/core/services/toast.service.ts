import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: number;
    type: ToastType;
    title: string;
    message: string;
}

@Injectable({
    providedIn: 'root',
})
export class ToastService {

    private readonly toastState = signal<ToastData[]>([]);

    public readonly toasts = this.toastState.asReadonly();

    private nextId = 1;

    public show(
        type: ToastType,
        title: string,
        message: string,
        duration = 3000
    ): void {

        const id = this.nextId++;

        const toast: ToastData = {
            id,
            type,
            title,
            message,
        };

        this.toastState.update((toasts) => [
            ...toasts,
            toast,
        ]);

        setTimeout(() => {
            this.remove(id);
        }, duration);
    }


    public success(
        title: string,
        message: string
    ): void {
        this.show(
            'success',
            title,
            message
        );
    }


    public error(
        title: string,
        message: string
    ): void {
        this.show(
            'error',
            title,
            message,
            4000
        );
    }


    public warning(
        title: string,
        message: string
    ): void {
        this.show(
            'warning',
            title,
            message
        );
    }


    public info(
        title: string,
        message: string
    ): void {
        this.show(
            'info',
            title,
            message
        );
    }


    public remove(id: number): void {

        this.toastState.update((toasts) =>
            toasts.filter(
                (toast) => toast.id !== id
            )
        );

    }

}