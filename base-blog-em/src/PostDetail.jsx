import { useQuery, useMutation } from 'react-query';

async function fetchComments(postId) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
  return response.json();
}

async function deletePost(postId) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/postId/${postId}`, {
    method: 'DELETE',
  });
  return response.json();
}

async function updatePost(postId) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/postId/${postId}`, {
    method: 'PATCH',
    data: { title: 'REACT QUERY FOREVER!!!!' },
  });
  return response.json();
}

export function PostDetail({ post }) {
  const { data, isError, error, isLoading } = useQuery(
    ['comments', post.id],
    () => fetchComments(post.id),
    {
      staleTime: 500,
    }
  );

  const deleteMutation = useMutation((postId) => deletePost(postId));
  const updateMutation = useMutation((postId) => updatePost(postId));

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (isError) {
    return (
      <div>
        Error<p>{error.toString()}</p>
      </div>
    );
  }

  return (
    <>
      <h3 style={{ color: 'blue' }}>{post.title}</h3>

      <button onClick={() => deleteMutation.mutate(post.id)}>Delete</button>
      {deleteMutation.isError ? <p style={{ color: 'red' }}>Error in deleting the post</p> : null}
      {deleteMutation.isLoading ? (
        <p style={{ color: 'purple' }}>Loading result in deleting the post</p>
      ) : null}
      {deleteMutation.isSuccess ? (
        <p style={{ color: 'green' }}>Success result in deleting the post</p>
      ) : null}

      <button onClick={() => updateMutation.mutate(post.id)}>Update title</button>
      {updateMutation.isError ? <p style={{ color: 'red' }}>Error in updating the post</p> : null}
      {updateMutation.isLoading ? (
        <p style={{ color: 'purple' }}>Loading result in updating the post</p>
      ) : null}
      {updateMutation.isSuccess ? (
        <p style={{ color: 'green' }}>Success result in updating the post</p>
      ) : null}

      <p>{post.body}</p>
      <h4>Comments</h4>
      {data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}
