export function Header() {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-4">
      <img src="/maid.jpg" className="size-18 rounded-full object-cover" />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">메이드-크로스-포스팅</h1>
        <p className="text-sm text-gray-600">
          여러 SNS에 동시에 글을 올려주는 메이드 서비스입니다.
        </p>
      </div>
    </div>
  );
}
