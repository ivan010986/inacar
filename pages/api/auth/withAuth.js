import { useEffect } from 'react';
import { useRouter } from 'next/router';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');

      // Si no hay token, redirigir al login
      if (!token) {
        router.replace('/login');
      }
    }, [router]);

    // Mientras no hay redirección, renderizar la página
    return <WrappedComponent {...props} />;
  };
};

withAuth.displayName = "withAuth";
export default withAuth;



// const WithAuth = () => {
//   // component logic
// };
// WithAuth.displayName = "WithAuth"; // Add this line
