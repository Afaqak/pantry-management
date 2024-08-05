import Sidebar from '@/components/sidebar';
import React from 'react';

const Layout = ({children}:{children:React.ReactNode}) => {
    return (
        <div>
            <Sidebar/>
            <div>{children}</div>
        </div>
    );
}

export default Layout;
