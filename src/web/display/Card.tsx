const CardTitle: React.FC = ({ children }) => (
  <div className="text-gray-800 text-lg font-medium">{children}</div>
);

interface Props {
  highlightOnHover?: boolean;
  large?: boolean;
}

type CardType = React.FC<Props> & {
  Title: typeof CardTitle;
};

export const Card: CardType = ({
  children,
  large = false,
  highlightOnHover = true,
}) => (
  <div
    className={`h-full bg-white rounded-md shadow ${
      highlightOnHover ? "hover:bg-gray-100" : ""
    } ${large ? "p-5 sm:p-10" : "px-4 py-3"}`}
  >
    {children}
  </div>
);

Card.Title = CardTitle;
