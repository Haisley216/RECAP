'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleStart = () => {
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
          rico
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
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full px-[29px] pb-[120px]">
        <button
          onClick={handleStart}
          className="w-full bg-[#00CEC0] text-white font-bold text-[16px] py-[15px] rounded-[8px] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-transform"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
