const accountRegex = /^[A-Za-z][A-Za-z0-9_]{3,19}$/;
const passwordRegex = /^[A-Za-z0-9!@#$%^&*(),.?/*-+|\=<>;:"]{7,19}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const regTest = (value: string, type: 'account'|'password'|'email') => {
    switch(type){
        case 'account': {
            return accountRegex.test(value)
        }
        case 'password': {
            return passwordRegex.test(value)
        }
        case 'email': {
            return emailRegex.test(value)
        }
        default: return false
    }
}




export default { regTest }