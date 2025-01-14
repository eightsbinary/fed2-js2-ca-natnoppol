import controllers from '../../../controllers/index';
import utils from '../../../utilities/utils';

async function init() {
  const menuIcon = document.getElementById("menuIcon");
  const closeIcon = document.getElementById("closeIcon");
  const mobileMenu = document.getElementById("mobile-menu");

  menuButton.addEventListener("click", () => {
    menuIcon.classList.toggle("hidden"); // Toggle 'hamburger' icon
    closeIcon.classList.toggle("hidden"); // Toggle 'close' icon
    mobileMenu.classList.toggle("hidden");// Toggle mobile menu visibility
  });


  const container = document.querySelector('.container');
  clearContent(container);
  try {
    const id = utils.getUrlParams('id');
    const post = await controllers.PostController.post(id);
    const { data } = post;
    renderPost(data, container)

    attachEditEvent(id);
    attachDeleteEvent(id);
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    container.innerHTML = '<p>Error loading post. Please try again later.</p>';
  }
}

function clearContent(target) {
  target.innerHTML = '';
}

async function renderPost(post, target) {
  const postElement = document.createElement('article');
  const SecondPostElement = document.createElement('div');

  postElement.classList.add('max-w-full', 'mx-auto', 'p-4', 'w-full','sm:w-1/2', 'lg:w-1/3');
  SecondPostElement.classList.add('max-w-full','mx-auto', 'p-4', 'w-full','sm:w-1/2', 'lg:w-2/3');

  const postCreated = utils.date(post.created);
  const tags = utils.formatTags(post.tags);


  postElement.innerHTML = `
      <img class="article__cover__image w-full h-auto object-cover md:rounded-lg" src="${
        post.media?.url ? post.media?.url : ''
      }" style="aspect-ratio: auto 1000/420;" width="1000" height="420" alt="${
    post.media?.alt ? post.media?.alt : ''
    }" />

  `;

  SecondPostElement.innerHTML= `
    <div class="p-4 max-w-full mx-auto">
      <div class="flex rounded-lg h-full dark:bg-gray-800 bg-teal-400 p-8 flex-col">
        <div class="flex items-center mb-3">
          <div class="w-12 h-12 mr-3 inline-flex items-center justify-center rounded-full dark:bg-indigo-500 bg-indigo-500 text-white flex-shrink-0">
             <a class="" href="/profile/?author=${post.author.name}">
              <img class="" src="${
              post.author.avatar.url
              }" alt="${post.author.avatar.alt} width="32" height="32" />
            </a>
          </div>
            
            <div>
              <div>
                <a href="/profile/?author=
                      ${post.author.name}">
                      <h2 class="text-white dark:text-white text-lg font-medium hover:text-blue-600">${post.author.name}</h2>
                </a>
              </div>
              <div>
                      <h2 class="text-white dark:text-white text-lg font-medium">Posted on ${postCreated}</h2>
              </div>
            </div>             


            <div class="flex flex-col justify-between flex-grow">
              <h2 class="story__title leading-relaxed text-xl text-white dark:text-gray-300 hover:text-blue-600 inline-flex items-center">
                ${post.title}
              </h2>
    
              <div class="leading-relaxed text-base text-white dark:text-gray-300">
                ${tags}
              </div>

              <div class="article__main">
                <div id="article-body" class="leading-relaxed text-xl text-white dark:text-gray-300 hover:text-blue-600 inline-flex items-center">
                ${post.body}
              </div>
            </div>
            
            <div class="article__actions">
                ${
                isAuthor(post.author.name)
                ? `<button class="btn btn-pill btn-primary btn__edit-post" id="editPost">Edit Post</button>
                <button class="btn btn-pill btn-danger  btn__delete-post" id="deletePost">Delete Post</button>`
                : ''
                }
            </div>
          </div>
        </div> 
      </div>   
    </div>     
  
  `
 
  target.appendChild(postElement);
  target.appendChild(SecondPostElement);
}

function attachEditEvent(id) {
  const editButton = document.getElementById('editPost');
  if (editButton) {
    editButton.addEventListener('click', () => {
      utils.redirectTo(`/post/edit/?id=${id}`);
    });
  }
}

function attachDeleteEvent(id) {
  const deleteButton = document.getElementById('deletePost');
  if (deleteButton) {
    deleteButton.addEventListener('click', async () => {
      const confirmed = window.confirm(
        'Are you sure you want to delete this post?'
      );
      if (confirmed) {
        controllers.PostController.onDeletePost(id);
      } else {
        console.log('Delete action canceled');
      }
    });
  }
}

function isAuthor(author) {
  const authUser = controllers.AuthController.authUser;
  if (authUser.name === author) return true;
  return false;
}

init();


