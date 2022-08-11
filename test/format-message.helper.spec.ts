import {formatMessage} from "../src/helpers/format-message.helper";
import {UserModel} from "../src/common/models/user.model";

describe('Format message helper', () => {
    test('must return valid string', () => {
        const mockUser: Partial<UserModel> = {
            username: 'username'
        };
        expect(formatMessage('message', mockUser as UserModel)).toBe('username: message');
    });
})