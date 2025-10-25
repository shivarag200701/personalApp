interface ButtonProps {
  isSubmitting: boolean;
  Initial: string;
  Loading: string;
}

const Button = ({ isSubmitting, Initial, Loading }: ButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full py-2 text-white font-semibold rounded-md
                 bg-gradient-to-r from-purple-500 to-pink-400
                 hover:opacity-90 transition-opacity cursor-pointer
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? Loading : Initial}
    </button>
  );
};

export default Button;
