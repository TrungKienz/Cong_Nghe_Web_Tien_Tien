import Image from "next/image";
import AuthForm from "./components/AuthForm";

const Auth = () => {
  return (
    <div 
      className="
        flex 
        min-h-full 
        flex-col 
        justify-center 
        py-12 
        sm:px-6 
        lg:px-8 
        bg-gray-100
      "
      style={{backgroundImage: "url('/images/background-login-page.jpg')", backgroundRepeat: "no-repeat", backgroundSize: "cover"}}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div style={{
          height: 70,
          width: 70,
          borderRadius: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
        className="mx-auto w-auto bg-pink-500"
        >
          <Image
            height="48"
            width="48"
            className="mx-auto w-auto"
            src="/images/logoMess.png"
            alt="Logo"
          />
        </div>
        
        <h2 
          className="
            mt-6 
            text-center 
            text-3xl 
            font-bold 
            tracking-tight 
            text-pink-500
          "
          style={{textTransform:"uppercase"}}
          >
            Mạng xã hội "Có tính phí"
        </h2>
      </div>
      <AuthForm />      
  </div>
  )
}

export default Auth;
