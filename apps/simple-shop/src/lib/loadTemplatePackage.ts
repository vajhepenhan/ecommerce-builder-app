export async function loadTemplatePackage(template: string) {
  return await import(`@template-packages/${template}`);
}
