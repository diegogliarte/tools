import { ToastType } from "@lib/toast";

export async function copyToClipboard(
    text: string,
    successMsg = "Copied!",
    errorMsg = "Failed to copy"
) {
    try {
        await navigator.clipboard.writeText(text);
        window.showToast?.(successMsg, ToastType.Success);
    } catch {
        window.showToast?.(errorMsg, ToastType.Error);
    }
}
