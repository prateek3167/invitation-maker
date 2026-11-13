import { api } from './account-api';
import type { Template } from '../../../packages/editor-core/document';
export async function loadCatalog(): Promise<Template[]> {
  const templates: Template[] = [];
  for (let page = 1; page <= 10; page++) {
    const result = await api<{ templates: Template[]; total: number }>(`/api/v1/templates?page=${page}&pageSize=50`);
    templates.push(...result.templates);
    if (templates.length >= result.total) break;
  }
  return templates;
}
