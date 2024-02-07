const UserRepository = require('../repository/user-repository');
const jwt = require('jsonwebtoken');
const { JWT_KEY } = require('../config/serverConfig');
const bcrypt = require('bcrypt');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }


    async create(data) {
        try {
            const user = await this.userRepository.create(data);
            return user;
        } catch (error) {
            console.log("Something went wrong in service layer");
            throw error;
        }
    }

    createToken(user) {
        try {

            const result = jwt.sign(user, JWT_KEY, { expiresIn: '1d' });
            return result;
        } catch (error) {
            console.log("Something went wrong in token creation");
            throw error;
        }
    }

    verifyToken(token) {
        try {
            const response = jwt.verify(token, JWT_KEY);
            return response;
        } catch (error) {
            console.log("Something went wrong in token validation", error);
            throw error;
        }
    }


    checkPassword(userInputPlainPassword, encryptedPassword) {
        try {
            return bcrypt.compareSync(userInputPlainPassword, encryptedPassword);
        } catch (error) {
            console.log("Something went wrong in password comparison");
            throw error;
        }
    }


    async signIn(email, plainPassword) {
        try {
            // step 1 -> fetch the use using the email
            const user = await this.userRepository.getByEmail(email);
            // step 2 -> compare incoming plain password with stores encrypted password
            const passwordsMatch = this.checkPassword(plainPassword, user.password);

            if (!passwordsMatch) {
                console.log("Password doesn't match");
                throw { error: 'Incorrect Password' };
            }

            //step 3 -> if password match then create a token and send it to the user
            const newJWT = this.createToken({ email: this.userRepository.email, id: user.id });
            return newJWT;
        } catch (error) {
            console.log("Something went wrong in Sign in process");
            throw error;
        }
    }


    async isAuthenticated(token) {
        try {
            const response = this.verifyToken(token);
            if (!response) {
                throw { error: 'Invalid Token' }
            }
            const user = this.userRepository.getById(response.id);
            if (!user) {
                throw { error: "No user with the corresponding token exists" };
            }
            return user.id;
        } catch (error) {
            console.log("Something went wrong in auth process");
            throw error;
        }
    }



}

module.exports = UserService;