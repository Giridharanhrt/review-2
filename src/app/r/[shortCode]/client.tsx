"use client";

import { useEffect, useState } from "react";

export default function ReviewRedirectClient({
    reviewText,
    customerName,
    shopName,
    placeId,
}: {
    reviewText: string;
    customerName: string;
    shopName: string;
    placeId: string;
}) {
    const [copied, setCopied] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

    useEffect(() => {
        async function copyAndRedirect() {
            try {
                await navigator.clipboard.writeText(reviewText);
                setCopied(true);
            } catch {
                // Fallback: select hidden textarea
                const textarea = document.getElementById("review-text") as HTMLTextAreaElement;
                if (textarea) {
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    document.execCommand("copy");
                    setCopied(true);
                }
            }

            // Redirect after a short delay
            setRedirecting(true);
            setTimeout(() => {
                window.location.href = googleReviewUrl;
            }, 1500);
        }

        copyAndRedirect();
    }, [reviewText, googleReviewUrl]);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
        >
            {/* Hidden textarea for fallback copy */}
            <textarea
                id="review-text"
                defaultValue={reviewText}
                style={{ position: "absolute", left: "-9999px" }}
                readOnly
            />

            <div
                style={{
                    background: "white",
                    borderRadius: "24px",
                    padding: "40px 30px",
                    maxWidth: "380px",
                    width: "100%",
                    textAlign: "center",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                }}
            >
                {/* Logo/Icon */}
                <div
                    style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontSize: "32px",
                    }}
                >
                    {copied ? "\u2705" : "\u2728"}
                </div>

                <h1
                    style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#1f2937",
                        margin: "0 0 8px",
                    }}
                >
                    {copied ? "Review Copied!" : "Preparing your review..."}
                </h1>

                <p
                    style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: "0 0 24px",
                        lineHeight: "1.5",
                    }}
                >
                    {redirecting
                        ? "Opening Google Reviews... Just tap Paste!"
                        : `Thank you ${customerName}! Copying your review for ${shopName}...`}
                </p>

                {/* Review preview */}
                <div
                    style={{
                        background: "#f9fafb",
                        borderRadius: "16px",
                        padding: "16px",
                        marginBottom: "24px",
                        textAlign: "left",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <p
                        style={{
                            fontSize: "13px",
                            color: "#374151",
                            lineHeight: "1.6",
                            margin: 0,
                        }}
                    >
                        {reviewText}
                    </p>
                </div>

                {/* Loading indicator */}
                {redirecting && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            marginBottom: "16px",
                        }}
                    >
                        <div
                            style={{
                                width: "20px",
                                height: "20px",
                                border: "3px solid #e5e7eb",
                                borderTopColor: "#8b5cf6",
                                borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                            }}
                        />
                        <span style={{ fontSize: "13px", color: "#8b5cf6", fontWeight: "600" }}>
                            Redirecting to Google...
                        </span>
                    </div>
                )}

                {/* Manual button fallback */}
                <a
                    href={googleReviewUrl}
                    style={{
                        display: "block",
                        background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
                        color: "white",
                        padding: "14px 24px",
                        borderRadius: "14px",
                        textDecoration: "none",
                        fontWeight: "700",
                        fontSize: "15px",
                        boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
                    }}
                >
                    {copied ? "Paste Review on Google" : "Open Google Reviews"}
                </a>

                <p
                    style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        marginTop: "16px",
                    }}
                >
                    Review text is in your clipboard. Just long-press and paste!
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
