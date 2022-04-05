const CardTitle: React.FC = ({ children }) => (
  <div className="text-gray-800 text-lg font-medium">{children}</div>
);

type CardType = React.FC & {
  Title: typeof CardTitle;
};

export const Card: CardType = ({ children }) => (
  <div className="h-full px-4 py-3 bg-white hover:bg-gray-100 rounded-md shadow">
    {children}
  </div>
);

Card.Title = CardTitle;
