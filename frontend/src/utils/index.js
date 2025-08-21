
import jwtDecode from "/node_modules/jwt-decode/build/jwt-decode.esm.js";

// ...existing code...
export const token_decode = (token) => {
    if (token) {
        try {
            const decode_data = jwtDecode(token); // use jwtDecode
            if (!decode_data.exp) {
                localStorage.removeItem('canva_token')
                return ""
            }
            const exp_time = new Date(decode_data.exp * 1000)

            if (new Date() > exp_time) {
                localStorage.removeItem('canva_token')
                return ""
            } else {
                return decode_data
            }
        } catch (error) {
            localStorage.removeItem('canva_token')
            return ""
        }
    } else {
        return ""
    }
}
