from django.contrib.auth.models import User
from django.views.generic import DetailView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponseBadRequest

from feed.models import Post
from profiles.models import Profile
from followers.models import Follower


class profileDetailView(DetailView):
    http_method_names = ["get"]
    template_name = "profiles/detail.html"
    model = User
    context_object_name = "user"
    slug_field = "username"
    slug_url_kwarg = "username"

    def get_context_data(self, **kwargs):
        viewed_user = self.get_object()
        profile = Profile.objects.get(user=viewed_user)
        user = self.request.user
        context = super().get_context_data(**kwargs)
        context["total_posts"] = Post.objects.filter(author=viewed_user).count()
        context["total_followers"] = profile.followers.count()
        context["total_following"] = profile.following.count()
        if user.is_authenticated:
            context["total_user_posts"] = Post.objects.filter(author=user).count()
        else:
            context["total_user_posts"] = None
        return context


class FollowView(LoginRequiredMixin, View):
    http_method_names = ["post"]

    def post(self, request, *args, **kwargs):
        data = request.POST.dict()

        if "action" not in data or "username" not in data:
            return HttpResponseBadRequest("Missing data")

        try:
            other_user = User.objects.get(username=data["username"])
        except User.DoesNotExist:
            return HttpResponseBadRequest("Missing data")

        if data["action"] == "follow":
            follower, created = Follower.objects.get_or_create(
                followed_by=request.user, following=other_user
            )
        else:
            try:
                follower = Follower.objects.get(
                    followed_by=request.user,
                    following=other_user,
                )
            except Follower.DoesNotExist:
                follower = None

            if follower:
                follower.delete()

        return JsonResponse(
            {
                "success": True,
                "wording": "unfollow" if data["action"] == "follow" else "Follow",
            }
        )
