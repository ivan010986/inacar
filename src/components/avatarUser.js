import Avatar from '@mui/material/Avatar';
import { Children } from 'react';

const AvatarUser = ({ nombre }) => {

    function stringToColor(string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    function stringAvatar(name) {
        const splitName = name.split(' ');
        const initials = splitName.length > 1
            ? `${splitName[0][0]}${splitName[1][0]}`
            : `${splitName[0][0]}${splitName[0][0]}`;
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: initials,
        };
    }
    return (<>
        <Avatar {...stringAvatar(`${nombre}`)} sx={{ width: 27, height: 27, fontSize: 12 }} />
    </>)
}
export default AvatarUser;