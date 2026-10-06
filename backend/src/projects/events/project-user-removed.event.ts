// Developed by Mateo Garcia Carreno

export class ProjectUserRemovedEvent {
  static readonly NAME = 'project.user-removed';

  constructor(
    readonly projectId: number,
    readonly userId: number,
  ) {}
}
