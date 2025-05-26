const generateSlug = (input) => {
    if (!input || typeof input !== "string") return "";
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-");     // Replace spaces with hyphens
};

export default generateSlug;