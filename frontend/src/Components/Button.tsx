interface ButtonProps {
  isSubmitting?: boolean;
  Initial?: string;
  Loading?: string;
}

const Button = ({ isSubmitting, Initial, Loading }: ButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full py-3 text-white font-medium rounded-xl
                 bg-accent hover:shadow-lg shadow-sm
                 hover:opacity-90 transition-opacity cursor-pointer
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? Loading : Initial}
    </button>
  );
};

export default Button;
