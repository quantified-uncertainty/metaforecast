const CardTitle: React.FC = ({ children }) => (
  <div className="text-gray-800 text-lg font-medium">{children}</div>
);

interface Props {
  highlightOnHover?: boolean;
}

type CardType = React.FC<Props> & {
  Title: typeof CardTitle;
};

export const Card: CardType = ({ children, highlightOnHover = true }) => (
  <div
    className={`h-full px-4 py-3 bg-white rounded-md shadow ${
      highlightOnHover ? "hover:bg-gray-100" : ""
    }`}
  >
    {children}
  </div>
);

Card.Title = CardTitle;
