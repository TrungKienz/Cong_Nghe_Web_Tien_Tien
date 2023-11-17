const EmptyState = () => {
  return ( 
    <div 
      className="
        px-4 
        py-10 
        sm:px-6 
        lg:px-8 
        lg:py-6 
        h-full 
        flex 
        justify-center 
        items-center 
        bg-gray-100
      "
      style={{ backgroundImage: "url('https://i.pinimg.com/originals/6b/9b/f2/6b9bf2590fae131220c2ebbf26f40a92.jpg')", backgroundSize: "cover" }}
    >
      <div className="text-center items-center flex flex-col">
        <h3 className="mt-2 text-6xl font-semibold text-white">
          Hãy bắt đầu một cuộc trò chuyện mới !!!
        </h3>
      </div>
    </div>
  );
}
 
export default EmptyState;
