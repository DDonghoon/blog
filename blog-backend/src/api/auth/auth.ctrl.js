import Joi from 'joi';
import User from '../../models/user';
import Post from "../../models/post";


/*
POST /api/auth/register
{
    username: 'velopert'',
    password: 'mypass123'
}
*/
export const register = async ctx => {
    // Request Body 검증하기
    const schema = Joi.object().keys({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(20)
            .required(),
        password: Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }



    const { username, password } = ctx.request.body;
    try {

        const exists = await User.findByUsername(username);
        if (exists) {
            ctx.status = 409; // Conflict
            return;
        }
        const user = new User({
            username,
        });
        await user.setPassword(password);
        await user.save();


        ctx.body= user.serialize();

        const token = user.generateToken();
        ctx.cookies.set('access_token',token,{
            maxAge :1000 *60*60*24*7,
            httpOnly:true,
        });

    }catch(e){
    ctx.throw(500,e);
    }
};



export const login = async ctx => {
    // 로그인
    const {username, password} = ctx.request.body;

    if (!username || !password) {
        ctx.status = 401; // Unauthorized
        return;
    }
    try {
        const user = await User.findByUsername(username);
        if (!user) {
            ctx.status = 401;
            return;
        }

        const valid = await user.checkPassword(password);
        // 잘못된 비밀번호
        if (!valid) {
            ctx.status = 401;
            return;
        }
        ctx.body= user.serialize();
        const token = user.generateToken();
        ctx.cookies.set('access_token',token,{
            maxAge :1000 *60*60*24*7,
            httpOnly:true,
        });
    }catch(e){
        ctx.throw(500,e);
    }
};


export const check = async ctx => {
    // 로그인 상태 확인

    const { user } =ctx.state;
    if(!user){
        ctx.state =401;
        return;
    }
    ctx.body =user;

};

export const logout = async ctx => {
    // 로그아웃
    ctx.cookies.set('access_token');
    ctx.status = 204; // No Content
};

export const remove = async ctx => {
    const { username } = ctx.request.body;
    try {
        await Post.findByIdAndRemove(username).exec();
        ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터는 없음)
    } catch (e) {
        ctx.throw(500, e);
    }
};