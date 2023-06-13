Magic cache is a key value store much like Redis. But it allows your keys (your prompts) to be a lot fuzzier.

E.g. a prompt of “Capital of USA” and “What is the capital of the United States?” should probably be the same key. So if you already know that “Capital Of USA” should have the completion “Washington DC”, then you could also return that from the cache for the prompt “What is the capital of the United States?”

You can customise the similarity threshold from 0 and 1 to find how exact you want matches to be.

# Quick start

## Sign in to Magic Cache 

Go to [magiccache](https://cache.scalingdevtools.com/) & signup/login 

## Copy your server API key and app ID

You should see a long API key like the below:

```jsx
25a52459-ggda-04d3-a3e8-160b23902b5z4
```

### Post a completion

```
curl --location --request POST 'https://magic-cache.herokuapp.com/cache/' \
--header 'Authorization: Bearer *API_KEY*' \
--header 'Content-Type: application/json' \
--data-raw '{
    "prompt": "Tell me a joke",
    "completion":"Sure, here'\''s a joke for you: Why don'\''t scientists trust atoms? Because they make up everything!"
}'
```

Example Response

```
{
    "success": true
}
```
### Search for matching completions

```
curl --location --request GET 'https://magic-cache.herokuapp.com/cache/' \
--header 'Authorization: Bearer *API_KEY*' \
--header 'Content-Type: application/json' \
--data-raw '{
    "prompt": "Joke please",
    "similarity_threshold":"0.5"
}'
```
Example Response:
```
[
    {
        "id": 13,
        "prompt": "Tell me a joke",
        "completion": "Sure, here's a joke for you: Why don't scientists trust atoms? Because they make up everything!",
        "similarity": 0.880884534086156
    }
]
```

### Self hosting

You can alternatively self host this yourself

Use the below variables
```
PORT=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```