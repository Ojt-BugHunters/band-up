package com.project.Band_Up.services.blog;

import com.project.Band_Up.dtos.blog.*;
import com.project.Band_Up.dtos.comment.BlogCommentResponse;
import com.project.Band_Up.dtos.comment.CommentAuthor;
import com.project.Band_Up.dtos.reply.BlogReplyResponse;
import com.project.Band_Up.entities.*;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.*;
import com.project.Band_Up.services.AwsService.S3Service;
import com.project.Band_Up.services.AwsService.S3ServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BlogServiceImpl implements BlogService {

    @Autowired
    private BlogRepository blogRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private ReplyRepository replyRepository;
    @Autowired
    private S3Service s3Service;
    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private ReactRepository reactRepository;

    @Override
    public BlogPosts createBlogPost(BlogRequest blogRequest, UUID accountId) {
        BlogPost blogPost = modelMapper.map(blogRequest, BlogPost.class);
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        blogPost.setAuthor(account);
        blogPost.setNumberOfReader(0);
        return modelMapper.map(blogRepository.save(blogPost), BlogPosts.class);
    }

    @Override
    @Transactional(readOnly = true)
    public BlogPostDetails getBlogPostDetails(UUID blogPostId) {
        BlogPost blogPost = blogRepository.findById(blogPostId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));


        BlogPostDetails blogPostDetails = modelMapper.map(blogPost, BlogPostDetails.class);
        int totalComment = blogPost.getComments().size();
        int totalReplies = 0;
        for (Comment comment : blogPost.getComments()) {
            for (Reply reply : comment.getReplies()) {
                totalReplies++;
            }
        }
        blogPostDetails.setTitleImg(s3Service.createCloudFrontSignedUrl(blogPost.getTitleImg()));
        blogPostDetails.setNumberOfComments(totalComment+totalReplies);
        blogPostDetails.setAuthor(BlogAuthor.builder()
                .id(blogPost.getAuthor().getId())
                .avatar(blogPost.getAuthor() != null ? s3Service.createCloudFrontSignedUrl(blogPost.getAuthor().getAvatarKey()) : null)
                .name(blogPost.getAuthor() != null ? blogPost.getAuthor().getName() : "")
                .build());
        List<BlogCommentResponse> commentResponses = blogPost.getComments().stream()
                .map(comment -> {
                    BlogCommentResponse commentResponse = modelMapper.map(comment, BlogCommentResponse.class);
                    if (comment.getUser() != null) {
                        CommentAuthor author = CommentAuthor.builder()
                                .id(comment.getUser().getId())
                                .name(comment.getUser().getName())
                                .avatar(comment.getUser().getAvatarKey() != null ?g
                                        s3Service.createCloudFrontSignedUrl(comment.getUser().getAvatarKey()) : null)
                                .build();
                        commentResponse.setAuthor(author);
                    }

                    if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
                        List<BlogReplyResponse> replyResponses = comment.getReplies().stream()
                                .map(reply -> {
                                    BlogReplyResponse replyResponse = modelMapper.map(reply, BlogReplyResponse.class);

                                    if (reply.getUser() != null) {
                                        CommentAuthor replyAuthor = CommentAuthor.builder()
                                                .id(reply.getUser().getId())
                                                .name(reply.getUser().getName())
                                                .avatar(reply.getUser().getAvatarKey() != null ?
                                                        s3Service.createCloudFrontSignedUrl(reply.getUser().getAvatarKey()) : null)
                                                .build();
                                        replyResponse.setAuthor(replyAuthor);
                                    }

                                    return replyResponse;
                                }).collect(Collectors.toList());
                        commentResponse.setReplies(replyResponses);
                    }

                    return commentResponse;
                }).collect(Collectors.toList());

        blogPostDetails.setComments(commentResponses);

        List<ReactDto> reactDtos = blogPost.getBlogReacts().stream()
                .map(react -> modelMapper.map(react, ReactDto.class))
                .collect(Collectors.toList());
        blogPostDetails.setReacts(reactDtos);
        blogPostDetails.setNumberOfReacts(blogPost.getBlogReacts().size());

        return blogPostDetails;
    }

    @Override
    public void addNumberOfReader(UUID blogPostId) {
        BlogPost blogPost = blogRepository.findById(blogPostId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        blogPost.setNumberOfReader(blogPost.getNumberOfReader()+1);
        blogRepository.save(blogPost);
    }

    @Override
    public Page<BlogPosts> getBlogPosts(Integer pageNo, Integer pageSize,
                                        String queryBy, Boolean ascending,
                                        UUID tagId) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, ascending ? Sort.by("numberOfReader").ascending() : Sort.by("numberOfReader").descending());

        Page<BlogPost> blogPostPage;

        if (tagId != null) {
            Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

            if(queryBy != null && !queryBy.isEmpty()){
                blogPostPage = blogRepository.findByTitleContainingIgnoreCaseAndTags(queryBy, List.of(tag), pageable);
            } else {
                blogPostPage = blogRepository.findByTags(List.of(tag), pageable);
            }
        } else {
            if(queryBy != null && !queryBy.isEmpty()){
                blogPostPage = blogRepository.findByTitleContainingIgnoreCase(queryBy, pageable);
            } else {
                blogPostPage = blogRepository.findAll(pageable);
            }
        }

        return blogPostPage.map(blogPost -> {
            BlogPosts posts = modelMapper.map(blogPost, BlogPosts.class);

            posts.setTitleImg(s3Service.createCloudFrontSignedUrl(blogPost.getTitleImg()));

            if (blogPost.getAuthor() != null) {
                BlogAuthor author = BlogAuthor.builder()
                        .id(blogPost.getAuthor().getId())
                        .name(blogPost.getAuthor().getName())
                        .avatar(blogPost.getAuthor().getAvatarKey() != null ?
                                s3Service.createCloudFrontSignedUrl(blogPost.getAuthor().getAvatarKey()) : null)
                        .build();
                posts.setAuthor(author);
            }

            int totalComments = blogPost.getComments().size();
            int totalReplies = 0;
            for (Comment comment : blogPost.getComments()) {
                totalReplies += comment.getReplies().size();
            }
            posts.setNumberOfComments(totalComments + totalReplies);

            return posts;
        });
    }

    @Override
    public List<BlogPosts> getFeaturedBlogPosts() {
        Pageable pageable = PageRequest.of(0, 5, Sort.by("numberOfReader").descending());
        Page<BlogPost> blogPostPage = blogRepository.findAll(pageable);

        return blogPostPage.map(blogPost -> {
            BlogPosts posts = modelMapper.map(blogPost, BlogPosts.class);

            posts.setTitleImg(s3Service.createCloudFrontSignedUrl(blogPost.getTitleImg()));

            if (blogPost.getAuthor() != null) {
                BlogAuthor author = BlogAuthor.builder()
                        .id(blogPost.getAuthor().getId())
                        .name(blogPost.getAuthor().getName())
                        .avatar(blogPost.getAuthor().getAvatarKey() != null ?
                                s3Service.createCloudFrontSignedUrl(blogPost.getAuthor().getAvatarKey()) : null)
                        .build();
                posts.setAuthor(author);
            }

            int totalComments = blogPost.getComments().size();
            int totalReplies = 0;
            for (Comment comment : blogPost.getComments()) {
                totalReplies += comment.getReplies().size();
            }
            posts.setNumberOfComments(totalComments + totalReplies);

            return posts;
        }).getContent();
    }

    @Override
    public List<TagDto> getAllTags() {
        return tagRepository.findAll().stream().map(tag -> modelMapper.map(tag, TagDto.class)).collect(Collectors.toList());
    }

    @Override
    public ReactDto reactToBlogPost(UUID userId, UUID blogId, ReactDto reactDto) {
        BlogPost blogPost = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Optional<BlogReact> existingReact = reactRepository.findByBlogPostAndReactAuthor(blogPost, account);

        if (existingReact.isPresent()) {
            BlogReact react = existingReact.get();

            if (react.getReactType() == reactDto.getReactType()) {
                reactRepository.delete(react);
                blogPost.getBlogReacts().remove(react);
                blogRepository.save(blogPost);
                return null;
            } else {
                react.setReactType(reactDto.getReactType());
                BlogReact savedReact = reactRepository.save(react);
                return modelMapper.map(savedReact, ReactDto.class);
            }
        } else {
            BlogReact newReact = BlogReact.builder()
                    .blogPost(blogPost)
                    .reactAuthor(account)
                    .reactType(reactDto.getReactType())
                    .build();
            BlogReact savedReact = reactRepository.save(newReact);
            blogPost.getBlogReacts().add(savedReact);
            blogRepository.save(blogPost);
            return modelMapper.map(savedReact, ReactDto.class);
        }
    }

}
