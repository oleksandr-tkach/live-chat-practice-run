import {UserModel} from "../common/models/user.model";

export function formatMessage(message: string, initiator: UserModel): string {
    return `${initiator.username}: ${message}`
}