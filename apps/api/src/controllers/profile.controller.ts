import {
  CrudController,
} from "kobp"
import {
  ProfileEntity,
} from "../db/entities"

export class ProfileController extends CrudController<ProfileEntity> {
  constructor() {
    super(ProfileEntity, 'profile', {
      resourceKeyPath: ':profileId',
      searchableFields: [
        'name',
        'profileId',
      ],
    })
  }
}