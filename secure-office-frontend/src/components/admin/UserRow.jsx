import React from 'react';

const UserRow = ({ user, currentUser, onDelete }) => {
    const isMe = currentUser && currentUser.id === user.id;

    return (
        <tr className={isMe ? "row-me" : ""}>
            <td style={{ color: 'var(--text-secondary)' }}>#{user.id}</td>

            <td className={isMe ? "text-me" : ""}>
                {user.firstName} {user.lastName}
                {isMe && <span className="badge-me">(Sen)</span>}
            </td>

            <td>{user.email}</td>

            <td>
                {user.roles.map(r => (
                    <span
                        key={r.id}
                        className={`role-badge ${r.name === 'ROLE_ADMIN' ? 'role-admin' : 'role-user'}`}
                    >
                        {r.name === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                    </span>
                ))}
            </td>

            <td style={{ textAlign: 'right' }}>
                {!isMe ? (
                    <button
                        onClick={() => onDelete(user.id)}
                        className="btn-delete-user"
                    >
                        Sil
                    </button>
                ) : (
                    <span className="icon-shield" title="Kendini silemezsin">🛡️</span>
                )}
            </td>
        </tr>
    );
};

export default UserRow;