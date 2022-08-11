import {v4 as uuidv4} from 'uuid';

export const MOCK_USERS = [
    {
        id: uuidv4(),
        username: 'John',
        authToken: 'auth-111',
    },
    {
        id: uuidv4(),
        username: 'Jane',
        authToken: 'auth-111',
    }
]