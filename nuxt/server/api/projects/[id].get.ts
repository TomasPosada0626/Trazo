// Developed by Mateo Garcia Carreno

// Internal imports
import { projects } from '../../data/projects';

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'));
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  return project;
});
