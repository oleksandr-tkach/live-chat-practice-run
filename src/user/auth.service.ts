import {UserModel} from "../common/models/user.model";
import {ERROR} from "../common/error/error";

export const authUser = function(users: UserModel[], authToken: string): UserModel {
    const user = users.find(u => u.authToken === authToken);
    if (!user) {
        throw Error(ERROR.auth.wrongCredentials)
    }
    return user;
}