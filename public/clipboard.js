async function copyToClipboard(
    text,
    successMsg = "Copied!",
    errorMsg = "Failed to copy"
) {
    try {
        await navigator.clipboard.writeText(text);
        window.showToast?.(successMsg, "success");
    } catch {
        window.showToast?.(errorMsg, "error");
    }
}
