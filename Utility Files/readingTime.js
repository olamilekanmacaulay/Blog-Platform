// Calculate reading time in minutes based on average reading speed (200 words per minute)

module.exports = (content) => {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
};