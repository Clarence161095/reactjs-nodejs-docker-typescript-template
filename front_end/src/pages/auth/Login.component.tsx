/* eslint-disable no-useless-escape */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRecoilState } from 'recoil';
import AuthApi from '../../api/auth.api';
import { Button, InputForm } from '../../components/Material.component';
import { DEFAULT_LOGGED_STATE, loggedGlobalState } from '../../states/login.state';
import Register from './Register.component';

function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  let navigate = useNavigate();
  const [loggedState, setLoggedState] = useRecoilState(loggedGlobalState);

  useEffect(() => {
    if (loggedState.logged) {
      navigate('/home');
    }
    if (localStorage.getItem('access-token')) {
      const _fetch = async () => {
        try {
          const resultGetToken: any = await AuthApi.getToken();

          if (resultGetToken.data.data.attributes) {
            localStorage.setItem(
              'email',
              resultGetToken.data.data.attributes['email']
            );
            localStorage.setItem(
              'role',
              resultGetToken.data.data.attributes['role']
            );
            setLoggedState({
              accessToken: localStorage.getItem('access-token'),
              email: resultGetToken.data.data.attributes['email'],
              role: resultGetToken.data.data.attributes['role'],
              logged: true,
            });
            navigate('/home');
          } else {
            setLoggedState(DEFAULT_LOGGED_STATE);
          }
        } catch (error) {
          setLoggedState(DEFAULT_LOGGED_STATE);
          localStorage.clear();
        }
      };
      _fetch();
    } else {
      setLoggedState(DEFAULT_LOGGED_STATE);
      localStorage.clear();
    }
  }, []);

  const handleLogin = () => {
    if (loggedState.logged) {
      navigate('/home');
    }

    if (checkDisabledButton()) {
      const _fetch = async () => {
        try {
          const resultLogin: any = await toast.promise(
            AuthApi.login(userName, password),
            {
              pending: '??ang ki???m tra ????ng nh???p...???',
              success: '????ng nh???p th??nh c??ng ????',
              error: '????ng nh???p th???t b???i!!!! ????',
            },
            {
              position: 'top-center',
              autoClose: 700,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );

          if (resultLogin.data.data.attributes['access-token']) {
            localStorage.setItem(
              'access-token',
              resultLogin.data.data.attributes['access-token']
            );
            localStorage.setItem(
              'refresh-token',
              resultLogin.data.data.attributes['refresh-token']
            );

            const resultGetToken: any = await AuthApi.getToken();

            if (resultGetToken.data.data.attributes) {
              localStorage.setItem(
                'email',
                resultGetToken.data.data.attributes['email']
              );
              localStorage.setItem(
                'role',
                resultGetToken.data.data.attributes['role']
              );
              setLoggedState({
                accessToken: resultLogin.data.data.attributes['access-token'],
                email: resultGetToken.data.data.attributes['email'],
                role: resultGetToken.data.data.attributes['role'],
                logged: true,
              });
            }
            navigate('/home');
          }
        } catch (error: any) {
          if (error.message) {
            switch (error.response.status) {
              case 304:
                setErrorMessage('Server l???i... xin vui l??ng tr??? l???i sau!');
                break;
              default:
                setErrorMessage('Sai t??n ????ng nh???p ho???c m???t kh???u!');
                break;
            }
          }
        }
      };
      _fetch();
    }
  };

  const checkValidateUser = () => {
    if (userName === '') {
      return '';
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(userName))
      return 'T??n ????ng nh???p ph???i l?? email.';
    return '';
  };

  const checkValidatePassword = () => {
    if (password === '') {
      return '';
    }
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/.test(password))
      return 'M???t kh???u ??t nh???t ph???i c?? 6 k?? t??? v?? ch???a k?? t??? in hoa.';
    return '';
  };

  const checkDisabledButton = () => {
    return (
      checkValidateUser() === '' &&
      checkValidatePassword() === '' &&
      userName !== '' &&
      password !== ''
    );
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[74vh]">
      <div
        className="flex flex-col justify-center items-center border-2 rounded-xl
          px-4 py-3 w-[95%] max-w-md bg-[#130f406d]"
      >
        {!isRegister && (
          <>
            <div className="text-[2.5rem]">????ng nh???p</div>

            <InputForm
              InputAttributes={{
                type: 'text',
                alt: 'username',
                placeholder: 'T??n ????ng nh???p/Email',
                value: userName,
                onKeyDown: handleKeyDown,
                onChange: (e: any) => setUserName(e.target.value),
              }}
              checkValidate={checkValidateUser}
            />

            <InputForm
              InputAttributes={{
                type: 'password',
                alt: 'password',
                placeholder: 'M???t kh???u',
                value: password,
                onKeyDown: handleKeyDown,
                onChange: (e: any) => setPassword(e.target.value),
              }}
              checkValidate={checkValidatePassword}
            />

            <div className="flex flex-row justify-center items-center my-2">
              <Button className="bg-[#27ae60]" onClick={() => setIsRegister(true)}>
                ????ng k??
              </Button>
              <Button
                className="ml-6"
                InputAttributes={{
                  disabled: !checkDisabledButton(),
                }}
                onClick={handleLogin}
              >
                ????ng nh???p
              </Button>
            </div>
            <span className="w-full text-orange-400 text-center">
              {errorMessage}
            </span>
          </>
        )}

        {isRegister && <Register setIsRegister={setIsRegister} />}
      </div>
    </div>
  );
}

export default Login;
