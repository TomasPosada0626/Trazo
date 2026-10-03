// Author: Mateo Garcia Carreno

// internal imports
import type { Project } from '../entities/project.entity.js';

export type ProjectRowDto = Project & { progress: number };
