# Content Analyzer - Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict typing**: All functions have explicit return types and parameter types
- **Interface definitions**: Complex objects use interfaces (e.g., `AnalysisResult`, `EvaluationResult`, `ContentData`)
- **Optional properties**: Use `?` for optional fields in interfaces
- **Type safety**: Avoid `any` type, use proper type assertions when needed

### Error Handling Patterns
- **Try-catch blocks**: All async operations wrapped in try-catch
- **Fallback responses**: Provide default values when operations fail
- **User-friendly messages**: Error messages in Arabic for user-facing components
- **Console logging**: Technical errors logged to console for debugging

### Function Documentation
- **JSDoc comments**: Functions include descriptive comments explaining purpose
- **Parameter descriptions**: Complex functions document parameters and return values
- **Arabic comments**: User-facing functionality documented in Arabic

## Structural Conventions

### File Organization
- **Utility separation**: Core logic in `/utils/` directory
- **Route organization**: API endpoints grouped by functionality in `/routes/`
- **Component structure**: React components in `/components/` and `/pages/`
- **Shared types**: Common interfaces in `/shared/types.ts`

### Naming Conventions
- **camelCase**: Variables and functions use camelCase
- **PascalCase**: React components and TypeScript interfaces
- **Descriptive names**: Functions clearly indicate their purpose (e.g., `evaluateSourceCredibility`, `extractContentFromUrl`)
- **Arabic labels**: UI text and user messages in Arabic

### Import Patterns
- **Grouped imports**: External libraries first, then internal modules
- **Destructured imports**: Material-UI components imported with destructuring
- **Type imports**: Separate type imports when needed

## Semantic Patterns

### React Component Structure
```typescript
// Standard component pattern with props interface
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initialValue);
  
  const handleAction = async () => {
    // Action logic
  };

  return (
    <Box>
      {/* JSX content */}
    </Box>
  );
};
```

### API Client Pattern
- **Singleton clients**: AI service clients initialized once and reused
- **Environment validation**: Check for API keys before client creation
- **Error boundaries**: Graceful degradation when services unavailable

### Database Operations
- **Mongoose models**: Use Mongoose for MongoDB operations
- **Schema definitions**: Explicit schema with proper types
- **Connection handling**: Check database availability before operations
- **Async/await**: Consistent async pattern for database operations

### State Management
- **useState hooks**: Local component state with proper typing
- **Loading states**: Boolean flags for async operations
- **Error states**: Separate error state management
- **Result caching**: Store API responses in component state

## Material-UI Integration

### Styling Patterns
- **sx prop**: Use sx prop for component-specific styling
- **Theme integration**: Leverage Material-UI theme colors and spacing
- **Responsive design**: Grid system for layout management
- **RTL support**: Right-to-left text alignment for Arabic content

### Component Usage
- **Consistent components**: Use Material-UI components throughout
- **Icon integration**: Material-UI icons with descriptive names
- **Form handling**: TextField and Button components for user input
- **Feedback components**: Alert, CircularProgress for user feedback

## API Design Patterns

### Request/Response Structure
- **Consistent endpoints**: RESTful API design with clear paths
- **JSON responses**: Structured JSON with success/error indicators
- **Error handling**: Proper HTTP status codes and error messages
- **Timeout handling**: Request timeouts for external API calls

### AI Service Integration
- **Provider abstraction**: Support multiple AI providers (Gemini, Groq)
- **Prompt engineering**: Structured prompts with clear instructions
- **Response parsing**: JSON parsing with fallback handling
- **Rate limiting**: Proper handling of API rate limits

## Internationalization

### Arabic Language Support
- **RTL layout**: Right-to-left text alignment
- **Arabic text**: All user-facing text in Arabic
- **Unicode handling**: Proper encoding for Arabic characters
- **Cultural adaptation**: UI patterns adapted for Arabic users

### Text Direction
- **Mixed content**: LTR for URLs and code, RTL for Arabic text
- **Input fields**: Proper direction handling for different content types
- **Layout adaptation**: Sidebar and navigation adapted for RTL

## Performance Considerations

### Content Processing
- **Content truncation**: Limit content size for AI processing
- **Lazy loading**: Load components and data as needed
- **Caching strategy**: Cache analysis results in database
- **Timeout handling**: Prevent hanging requests with timeouts

### Resource Management
- **Memory efficiency**: Proper cleanup of resources
- **Connection pooling**: Efficient database connection management
- **Error recovery**: Graceful handling of service failures