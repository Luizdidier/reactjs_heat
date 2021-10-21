import { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import { api } from '../../services/api'
import { FlagIcon, FlagIconCode } from "react-flag-kit";
import styles from './styles.module.scss';
import logoImg from '../../assets/logo.svg';
import { AuthContext } from '../../context/auth';

interface Message {
    created_at: string;
    id: string;
    text: string;
    user: {
        name: string;
        avatar_url: string;
        login: string;
    }
    countryCode: FlagIconCode;
    user_id: string;
}

let messagesQueue: Message[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', (newMessage: Message) => {
    messagesQueue.push(newMessage);
});

export function MessageList() {
    const [messages, setMessages] = useState<Message[]>([]);
    const { country } = useContext(AuthContext);

    useEffect(() => {
        setInterval(() => {
            if(messagesQueue.length > 0) {
                setMessages((prevState) => [
                    messagesQueue[0],
                    prevState[0],
                    prevState[1]
                ].filter(Boolean));
                messagesQueue.shift();
            }
        }, 1000)
    }, [])


    useEffect(() => {
        api.get<Message[]>('messages/last3').then((res) => {
            setMessages(res.data);
        })
    }, [])

    return (
        <div className={styles.messageListWrapper}>
            <img src={logoImg} alt="DoWhile2021" />

            <ul className={styles.messageList}>
                {messages.map((message) => (
                    <li key={message.id} className={styles.message}>
                        <p className={styles.messageContent}>
                            {message.text}
                        </p>
                        <div className={styles.messageUser}>
                            <div className={styles.userImage}>
                                <img src={message.user.avatar_url} alt={message.user.name} />
                            </div>
                            <div className={styles.messageInformation}>
                                <a href={`https://github.com/${message.user.login}`} target="_blank">
                                    {message.user.name}
                                </a>
                                <span className={styles.timeAndCountryMessage}>
                                    {moment(message.created_at).format('HH:mm')}
                                    <FlagIcon code={message.countryCode} />
                                </span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}