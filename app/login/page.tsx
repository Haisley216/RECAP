'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' || localStorage.getItem('anonymous') === 'true') {
      router.replace('/');
    }
  }, [status, router]);

  if (status === 'loading') return null;

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const handleAnonymous = () => {
    localStorage.setItem('anonymous', 'true');
    router.replace('/');
  };

  return (
    <div className="screen relative bg-[#F8FAFD]">
      {/* 텍스트 영역 */}
      <div className="px-[29px] pt-[181px]">
        <h1
          className="text-[40px] leading-normal text-black"
          style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}
        >
          RECAP
        </h1>
        <p className="mt-1 text-[20px] font-semibold text-black leading-normal">
          AI 면접 회고 서비스
        </p>
        <div className="mt-[55px] text-[16px] font-semibold text-[#909090] leading-[21px]">
          <p>면접 보고 오셨나요?</p>
          <p>AI와 함께 복기하고 다음 면접을 준비해보세요</p>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full px-[29px] pb-[120px] flex flex-col gap-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black font-bold text-[16px] py-[15px] rounded-[8px] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          구글로 시작하기
        </button>
        <button
          onClick={handleAnonymous}
          className="w-full bg-[#00CEC0] text-white font-bold text-[16px] py-[15px] rounded-[8px] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-transform"
        >
          로그인 없이 시작하기
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M47.532 24.552c0-1.636-.147-3.2-.42-4.704H24.48v8.898h12.958c-.558 3.012-2.25 5.566-4.8 7.278v6.042h7.764c4.542-4.182 7.13-10.338 7.13-17.514z" fill="#4285F4"/>
      <path d="M24.48 48c6.504 0 11.952-2.154 15.936-5.832l-7.764-6.042c-2.154 1.44-4.908 2.292-8.172 2.292-6.288 0-11.616-4.248-13.518-9.954H2.934v6.234C6.9 42.846 15.132 48 24.48 48z" fill="#34A853"/>
      <path d="M10.962 28.464A14.418 14.418 0 0 1 10.2 24c0-1.554.27-3.066.762-4.464v-6.234H2.934A23.952 23.952 0 0 0 .48 24c0 3.876.924 7.548 2.454 10.698l8.028-6.234z" fill="#FBBC05"/>
      <path d="M24.48 9.582c3.546 0 6.726 1.218 9.228 3.612l6.918-6.918C36.426 2.394 30.984 0 24.48 0 15.132 0 6.9 5.154 2.934 13.302l8.028 6.234c1.902-5.706 7.23-9.954 13.518-9.954z" fill="#EA4335"/>
    </svg>
  );
}
