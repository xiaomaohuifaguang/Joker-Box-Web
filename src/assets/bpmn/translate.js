import translations from './zh'



export const customTranslate = (template, replacements) => {
    replacements = replacements || {};


    // Translate
    template = translations[template.toLowerCase()] || template;

    // Replace
    return template.replace(/{([^}]+)}/g, (_, key) => {
        return replacements[key] || '{' + key + '}';
    });
}