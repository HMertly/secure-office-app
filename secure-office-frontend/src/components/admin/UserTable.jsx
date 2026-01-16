import React from 'react';
import UserRow from "./UserRow";

const UserTable = ({ users, currentUser, onDelete }) => {
    return (
        <div className="table-card">
            <table className="user-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>İsim</th>
                    <th>E-Posta</th>
                    <th>Roller</th>
                    <th style={{ textAlign: 'right' }}>İşlem</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <UserRow
                        key={user.id}
                        user={user}
                        currentUser={currentUser}
                        onDelete={onDelete}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;