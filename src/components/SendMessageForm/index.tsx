import { FormEvent, SetStateAction, useContext, useState } from 'react';
import { VscGithubInverted, VscSignOut } from 'react-icons/vsc';
import { AuthContext } from '../../context/auth';
import { api } from '../../services/api';
import styles from './styles.module.scss';

export function SendMessageForm() {
    const { user, signOut, country: countryCode } = useContext(AuthContext);
    const [message, setMessage] = useState('');

    const changeTextArea = (event: { target: { value: SetStateAction<string>; }; }) => {
        setMessage(event.target.value);
    }

    const handleSendMessage = async (event: FormEvent) => {
        event.preventDefault();
        if(!message.trim())
            return;
        
        await api.post('messages', { message, countryCode })

        setMessage('');
    }

    return (
        <div className={styles.sendMessageFormWrapper}>
            <button onClick={signOut} className={styles.signOutButton}>
                <VscSignOut size="32"/>
            </button>

            <header className={styles.userInformation}>
                <div className={styles.userImage}>
                    <img src={user?.avatar_url} alt={user?.name} />
                </div>
                <strong className={styles.userName}>{user?.name}</strong>
                <span className={styles.userGithub}>
                    <VscGithubInverted size="16" /> 
                    {user?.login}
                </span>
            </header>

            <form onSubmit={handleSendMessage} className={styles.sendMessageForm}>
                <label htmlFor="message">Messagem</label>
                <textarea 
                    name="message"
                    id="message"
                    placeholder="Qual sua expectativa para o evento?"
                    onChange={changeTextArea}
                    value={message}
                />

                <button type="submit">
                    Enviar Mensagem
                </button>
            </form>
        </div>
    )
}