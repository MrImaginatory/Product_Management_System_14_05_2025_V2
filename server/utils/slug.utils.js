const generateSlug = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // remove special characters
            .replace(/\s+/g, '-')     // replace spaces with -
            .replace(/-+/g, '-');     // collapse multiple hyphens
    };

export default generateSlug;