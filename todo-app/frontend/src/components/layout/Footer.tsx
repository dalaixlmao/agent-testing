const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 py-4 mt-8">
      <div className="container mx-auto px-4 flex justify-center items-center">
        <p className="text-gray-600 text-sm">
          &copy; {currentYear} Todo App. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;