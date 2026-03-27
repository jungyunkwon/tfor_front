import { Notify } from 'quasar';

export const showErrorToast = (message) => {
    Notify.create({
        type: 'negative',
        message,
        position: 'bottom',
        timeout: 3000,
    });
};

export const showSuccessToast = (message) => {
    Notify.create({
        type: 'positive',
        message,
        position: 'top',
        timeout: 2500,
    });
};

export const showInfoToast = (message) => {
    Notify.create({
        type: 'info',
        message,
        position: 'bottom',
        timeout: 2500,
    });
};

export const showWarningToast = (message) => {
    Notify.create({
        type: 'warning',
        message,
        position: 'bottom',
        timeout: 2500,
    });
};